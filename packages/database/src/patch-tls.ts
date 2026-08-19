import tls from "node:tls";

const originalGetPeerCertificate = tls.TLSSocket.prototype.getPeerCertificate;

(tls.TLSSocket.prototype as any).getPeerCertificate = function (
	this: tls.TLSSocket,
	...args: any[]
) {
	const cert = (originalGetPeerCertificate as any).apply(this, args);
	if (cert && typeof cert === "object" && cert.fingerprint256 === undefined) {
		cert.fingerprint256 = cert.fingerprint ?? "";
	}
	return cert;
};

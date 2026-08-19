"use client";

import Link, { type LinkProps } from "next/link";
import React from "react";

const NextLink = React.forwardRef<HTMLAnchorElement, LinkProps>(
	function NextLink(props, ref) {
		// forward to next/link which supports ref forwarding in modern Next.js
		return <Link {...props} ref={ref} />;
	},
);

export default NextLink;

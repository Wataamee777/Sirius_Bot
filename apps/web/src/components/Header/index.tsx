"use client";

import "./style.scss";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const NAV_LINKS = [
	{ href: "/about", label: "SiriusBotについて" },
	{ href: "/commands", label: "コマンド一覧" },
	{ href: "/invite", label: "招待" },
	{ href: "/support", label: "サポート" },
	{ href: "/login", label: "ログイン" },
	{ href: "/terms", label: "利用規約" },
	{ href: "/privacy", label: "プライバシーポリシー" },
];

export default function SiteShell({ children }: { children: React.ReactNode }) {
	const [menuOpen, setMenuOpen] = useState(false);

	useEffect(() => {
		const canvas = document.getElementById("stars") as HTMLCanvasElement | null;
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		type Star = { x: number; y: number; size: number; speed: number };
		type ShootingStar = {
			x: number;
			y: number;
			len: number;
			speed: number;
			life: number;
			maxLife: number;
		};

		const stars: Star[] = [];
		const shootingStars: ShootingStar[] = [];
		const resize = () => {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
		};

		const createShootingStar = () => {
			shootingStars.push({
				x: Math.random() * canvas.width,
				y: Math.random() * canvas.height * 0.5,
				len: Math.random() * 80 + 50,
				speed: Math.random() * 6 + 6,
				life: 0,
				maxLife: 80,
			});
		};

		const draw = () => {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			stars.forEach((star) => {
				const s = star;
				s.y += s.speed;
				if (s.y > canvas.height) {
					s.y = 0;
					s.x = Math.random() * canvas.width;
				}
				ctx.beginPath();
				ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
				ctx.fillStyle = "white";
				ctx.fill();
			});

			for (let i = shootingStars.length - 1; i >= 0; i -= 1) {
				const s = shootingStars[i];
				const prevX = s.x;
				const prevY = s.y;
				s.x += s.speed;
				s.y += s.speed * 0.5;
				s.life += 1;

				ctx.beginPath();
				ctx.moveTo(prevX, prevY);
				ctx.lineTo(s.x - s.len, s.y - s.len * 0.5);
				ctx.strokeStyle = "white";
				ctx.lineWidth = 2;
				ctx.stroke();

				if (s.life > s.maxLife) {
					shootingStars.splice(i, 1);
				}
			}

			requestAnimationFrame(draw);
		};

		resize();
		window.addEventListener("resize", resize);

		for (let i = 0; i < 120; i += 1) {
			stars.push({
				x: Math.random() * canvas.width,
				y: Math.random() * canvas.height,
				size: Math.random() * 2,
				speed: Math.random() * 0.3 + 0.1,
			});
		}

		const shootingStarTimer = window.setInterval(createShootingStar, 500);
		draw();

		return () => {
			window.removeEventListener("resize", resize);
			window.clearInterval(shootingStarTimer);
		};
	}, []);

	return (
		<>
			<canvas id="stars" />

			<header>
				<Link id="title" aria-label="トップページへ移動" href="/">
					<Image
						alt="SiriusBot"
						src="/assets/icon.png"
						width={40}
						height={40}
					/>
					<span>SiriusBot</span>
				</Link>

				<nav className="nav-pc" aria-label="グローバルナビゲーション">
					{NAV_LINKS.map((link) => (
						<Link key={link.href} href={link.href}>
							{link.label}
						</Link>
					))}
				</nav>

				<button
					id="hamburger-button"
					aria-label="メニューを開く"
					aria-expanded={menuOpen}
					aria-controls="mobile-menu"
					type="button"
					onClick={() => setMenuOpen((prev) => !prev)}
				>
					☰
				</button>
			</header>

			{menuOpen && (
				<div className="overlay" role="dialog" aria-modal="true">
					<button
						type="button"
						className="overlay-backdrop"
						aria-label="メニューを閉じる"
						onClick={() => setMenuOpen(false)}
					/>

					<nav id="mobile-menu">
						{NAV_LINKS.map((link) => (
							<Link
								key={link.href}
								href={link.href}
								onClick={() => setMenuOpen(false)}
							>
								{link.label}
							</Link>
						))}
					</nav>
				</div>
			)}

			<main id="center">{children}</main>
		</>
	);
}

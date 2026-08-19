import Image from "next/image";

type Staff = { name: string; role: string; icon: string };

function getRoleClass(role: string) {
	if (role === "サーバー主") return "role-owner";
	if (role === "管理者") return "role-admin";
	if (role === "モデレーター") return "role-moderater";
	if (role === "サポーター") return "role-supporter";
	return "";
}

export default function StaffList({ staff }: { staff: Staff[] }) {
	return (
		<div id="staff-list" className="staff-container">
			{staff.map((member) => (
				<div className="staff-card" key={`${member.name}-${member.role}`}>
					<Image
						src={member.icon}
						className="staff-icon"
						alt={member.name}
						width={64}
						height={64}
					/>
					<h3 className="staff-name">{member.name}</h3>
					<span className={`role-tag ${getRoleClass(member.role)}`}>
						{member.role}
					</span>
				</div>
			))}
		</div>
	);
}

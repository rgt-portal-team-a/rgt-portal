import React from "react";

interface RoleProps {
  roles: string[];
  userRole: string;
  children: React.ReactNode;
}

const WithRole: React.FC<RoleProps> = ({ roles, userRole, children }) => {
  if (roles.includes(userRole.toLowerCase())) return <>{children}</>;
  else return null;
};

export default WithRole;

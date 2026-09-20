import { demoUsers } from "../../data/mockData";

function AccountManagementWorkspace() { return <div><div className="page-heading"><div><p className="eyebrow">Admin workspace</p><h1>Account management</h1><p className="muted">Mock accounts are shown here until the identity API is connected.</p></div></div><div className="table-card"><div className="responsive-table"><table><thead><tr><th>Name</th><th>Username</th><th>Role</th><th>Department</th></tr></thead><tbody>{demoUsers.map((user) => <tr key={user.id}><td><strong>{user.name}</strong></td><td>{user.username}</td><td><span className="tag">{user.role}</span></td><td>{user.department}</td></tr>)}</tbody></table></div></div></div>; }
export default AccountManagementWorkspace;

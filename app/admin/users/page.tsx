import { getAdminUsers } from "@/lib/admin-actions";
import UserTable from "@/components/admin/UserTable";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const users = await getAdminUsers();
  return (
    <div className="space-y-6 px-4 py-6 sm:px-8 sm:py-8">
      <div>
        <h1 className="display text-3xl">Users</h1>
        <p className="mt-1 text-sm text-ink-soft">
          {users.length} registered user{users.length === 1 ? "" : "s"}. Change a role to move someone between the three sides.
        </p>
      </div>
      <UserTable initial={users} />
    </div>
  );
}

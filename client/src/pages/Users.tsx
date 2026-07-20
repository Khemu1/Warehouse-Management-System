import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/data-table/pagination";
import { AppDialog } from "@/components/dialogs/app-dialog";
import { useDialogStore } from "@/stores/dialog-store";
import {
  useUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
} from "@/hooks/use-users";
import { UserForm } from "@/components/users/user-form";
import type { EditUser, NewUser, User } from "@/types/users";
import {
  LuPlus,
  LuSearch,
  LuEllipsis,
  LuPencil,
  LuTrash2,
} from "react-icons/lu";

export default function Users() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const dialog = useDialogStore();

  const { data, isLoading } = useUsers(page, 10, search);
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const users = data?.items ?? [];
  const meta = data?.meta;

  const handleSave = (userData: NewUser | EditUser) => {
    if ("id" in userData && userData.id) {
      updateUser.mutate(userData as EditUser);
    } else {
      createUser.mutate(userData as NewUser);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Users</h2>
          <p className="text-sm text-muted-foreground">
            Manage system users and roles.
          </p>
        </div>
        <Button onClick={() => dialog.open("user-form")}>
          <LuPlus className="mr-1.5 h-4 w-4" /> Add User
        </Button>
      </div>

      <div className="relative">
        <LuSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="pl-9"
        />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            All Users ({meta?.totalItems ?? 0})
          </CardTitle>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-8 text-muted-foreground"
                >
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant={user.role === "admin" ? "default" : "secondary"}
                      className="capitalize"
                    >
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <LuEllipsis className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => dialog.open("user-form", user)}
                        >
                          <LuPencil className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>{" "}
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => deleteUser.mutate(user.id)}
                        >
                          <LuTrash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {meta && (
          <Pagination
            page={meta.currentPage}
            totalPages={meta.totalPages}
            total={meta.totalItems}
            onPageChange={setPage}
          />
        )}
      </Card>

      <AppDialog
        open={dialog.isOpen("user-form")}
        onClose={() => dialog.close("user-form")}
        title={dialog.getData<User>("user-form") ? "Edit User" : "Add User"}
      >
        <UserForm
          user={dialog.getData<User>("user-form")}
          onSave={handleSave}
          isLoading={createUser.isPending || updateUser.isPending}
          onClose={() => dialog.close("user-form")}
          serverErrors={
            createUser.apiError?.errors || updateUser.apiError?.errors
          }
        />
      </AppDialog>
    </div>
  );
}

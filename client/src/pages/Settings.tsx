import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/auth-store";
import { useUpdateUser } from "@/hooks/use-users";
import { editUserSchema, type EditUserFormData } from "@/validations/user";
import { getFieldError } from "@/utils/form-errors";
import { LuUser } from "react-icons/lu";

export default function Settings() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const [saved, setSaved] = useState(false);
  const updateUser = useUpdateUser();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EditUserFormData>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
      password: "",
    },
  });

  const onSubmit: SubmitHandler<EditUserFormData> = (data) => {
    const payload: Record<string, unknown> = { ...data, id: user!.id };
    if (!payload.password) delete payload.password;
    delete payload.role;

    updateUser.mutate(payload as any, {
      onSuccess: () => {
        setUser({
          ...user!,
          name: payload.name as string,
          email: payload.email as string,
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      },
    });
  };
  if (!user) return null;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight">Settings</h2>
        <p className="text-sm text-muted-foreground">
          Manage your account settings.
        </p>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile</CardTitle>
          <CardDescription>Update your personal information.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            <div className="flex items-center gap-4 pb-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <LuUser className="h-7 w-7 text-primary" />
              </div>
              <div>
                <p className="font-medium">{user.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge
                    variant={user.role === "admin" ? "default" : "secondary"}
                    className="capitalize"
                  >
                    {user.role}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {user.email}
                  </span>
                </div>
              </div>
            </div>

            <FormField
              label="Name"
              error={getFieldError("name", errors, updateUser.apiError?.errors)}
              required
            >
              <Input {...register("name")} />
            </FormField>

            <FormField
              label="Email"
              error={getFieldError(
                "email",
                errors,
                updateUser.apiError?.errors,
              )}
              required
            >
              <Input type="email" {...register("email")} />
            </FormField>

            <FormField
              label="New Password (leave blank to keep current)"
              error={getFieldError(
                "password",
                errors,
                updateUser.apiError?.errors,
              )}
            >
              <Input type="password" {...register("password")} />
            </FormField>

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={updateUser.isPending}>
                {updateUser.isPending
                  ? "Saving..."
                  : saved
                    ? "Saved!"
                    : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getFieldError } from "@/utils/form-errors";
import {
  editUserSchema,
  type UserFormData,
  userSchema,
} from "@/validations/user";
import { Roles, type EditUser, type NewUser, type User } from "@/types/users";

interface Props {
  user?: User | null;
  onSave: (data: NewUser | EditUser) => void;
  isLoading: boolean;
  onClose: () => void;
  serverErrors?: Record<string, string>;
}

export function UserForm({
  user,
  onSave,
  isLoading,
  onClose,
  serverErrors,
}: Props) {
  const schema = user ? editUserSchema : userSchema;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
      password: "",
      role: user?.role ?? Roles.STAFF,
    },
  });

  const onSubmit: SubmitHandler<UserFormData> = (data) => {
    const payload = { ...data };
    if (!payload.password) delete payload.password;
    onSave(user ? { ...payload, id: user.id } : payload);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-2">
      <FormField
        label="Name"
        error={getFieldError("name", errors, serverErrors)}
        required
      >
        <Input {...register("name")} />
      </FormField>

      <FormField
        label="Email"
        error={getFieldError("email", errors, serverErrors)}
        required
      >
        <Input type="email" {...register("email")} />
      </FormField>

      <FormField
        label={user ? "New Password (leave blank to keep)" : "Password"}
        error={getFieldError("password", errors, serverErrors)}
        required={!user}
      >
        <Input type="password" {...register("password")} />
      </FormField>

      <FormField
        label="Role"
        error={getFieldError("role", errors, serverErrors)}
        required
      >
        <Select
          defaultValue={user?.role ?? "staff"}
          onValueChange={(v) => setValue("role", v as Roles)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={Roles.ADMIN}>Admin</SelectItem>
            <SelectItem value={Roles.STAFF}>Staff</SelectItem>
          </SelectContent>
        </Select>
      </FormField>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : user ? "Save Changes" : "Create User"}
        </Button>
      </div>
    </form>
  );
}

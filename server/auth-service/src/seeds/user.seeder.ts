import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { hashPassword } from '../auth/auth.helpers';
import { Roles } from '@shared/types';
import { User } from '@shared/entities/user.entity';
export class STAFFSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const repo = dataSource.getRepository(User);

    const password = await hashPassword('password123');

    await repo.save([
      {
        name: 'Ahmed ADMIN',
        email: 'ahmed@test.com',
        password,
        role: Roles.ADMIN,
      },
      {
        name: 'Sara ADMIN',
        email: 'sara@test.com',
        password,
        role: Roles.ADMIN,
      },
      {
        name: 'Ali Staff',
        email: 'ali@test.com',
        password,
        role: Roles.STAFF,
      },
      {
        name: 'Mona Staff',
        email: 'mona@test.com',
        password,
        role: Roles.STAFF,
      },
      {
        name: 'Omar Staff',
        email: 'omar@test.com',
        password,
        role: Roles.STAFF,
      },
    ]);

    console.log('✅ STAFFs seeded');
  }
}

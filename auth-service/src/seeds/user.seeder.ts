import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { Users } from '@shared/entities/users.entity';
import { hashPassword } from '../auth/auth.helpers';
import { Roles } from '@shared/types';

export class UserSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const repo = dataSource.getRepository(Users);

    const password = await hashPassword('password123');

    await repo.save([
      {
        name: 'Ahmed Organizer',
        email: 'ahmed@test.com',
        password,
        role: Roles.ORGANIZER,
      },
      {
        name: 'Sara Organizer',
        email: 'sara@test.com',
        password,
        role: Roles.ORGANIZER,
      },
      {
        name: 'Ali Attendee',
        email: 'ali@test.com',
        password,
        role: Roles.USER,
      },
      {
        name: 'Mona Attendee',
        email: 'mona@test.com',
        password,
        role: Roles.USER,
      },
      {
        name: 'Omar Attendee',
        email: 'omar@test.com',
        password,
        role: Roles.USER,
      },
    ]);

    console.log('✅ Users seeded');
  }
}

// events-service/src/seeds/event.seeder.ts
import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { Events } from '../events/entities/event.entity';

export class EventSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const repo = dataSource.getRepository(Events);

    // always in the future
    const future = (daysFromNow: number) => {
      const date = new Date();
      date.setDate(date.getDate() + daysFromNow);
      return date;
    };

    await repo.save([
      {
        title: 'Tech Summit 2026',
        description:
          'Annual tech conference covering AI, cloud, and web development.',
        date: future(30),
        location: 'Cairo International Conference Center',
        total_seats: 200,
        available_seats: 200,
        price: 150.0,
        organizer_id: null,
      },
      {
        title: 'Startup Pitch Night',
        description:
          'Early stage startups pitch to investors and get feedback.',
        date: future(45),
        location: 'GrEEK Campus, Cairo',
        total_seats: 100,
        available_seats: 100,
        price: 50.0,
        organizer_id: null,
      },
      {
        title: 'React & Node Workshop',
        description: 'Hands-on full day workshop building a real-world app.',
        date: future(60),
        location: 'Alexandria Tech Hub',
        total_seats: 50,
        available_seats: 50,
        price: 75.0,
        organizer_id: null,
      },
      {
        title: 'Music Festival Cairo',
        description: 'Three days of live music across multiple stages.',
        date: future(90),
        location: 'Cairo Stadium',
        total_seats: 5000,
        available_seats: 5000,
        price: 200.0,
        organizer_id: null,
      },
      {
        title: 'Photography Masterclass',
        description:
          'Learn professional photography from award winning photographers.',
        date: future(15),
        location: 'Downtown Cairo Studio',
        total_seats: 30,
        available_seats: 30,
        price: 120.0,
        organizer_id: null,
      },
    ]);

    console.log('✅ Events seeded');
  }
}

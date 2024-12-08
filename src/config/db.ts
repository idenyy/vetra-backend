import { Sequelize } from 'sequelize';
import { config } from 'dotenv';

config();

export const sequelize = new Sequelize({
  dialect: 'postgres',
  username: process.env.PG_USER as string,
  host: process.env.PG_HOST as string,
  database: process.env.PG_DATABASE as string,
  password: process.env.PG_PASSWORD as string,
  port: Number(process.env.PG_PORT) as number,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  logging: false
});

const connectDB = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log(`PostgreSQL database connected`);
  } catch (error: any) {
    console.error(`Error connecting to database: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;

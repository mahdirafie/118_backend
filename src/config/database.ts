import { Sequelize } from "sequelize";

const sequelize = new Sequelize('basu118', 'basu', 'basudb', {
    host: 'localhost',
    dialect: 'mysql',
    logging: true
});

export default sequelize;
const amqp = require('amqplib');
const logger = require('./logger');

let connection = null;
let channel = null;

const exchangeName = 'cinema_events';
const queueName = 'notification_queue';
const routingKey = 'schedule';

async function connectRabbitMQ() {
  try {
    connection = await amqp.connect(process.env.RABBITMQ_URL);
    channel = await connection.createChannel();
    
    // Thiết lập Exchange loại 'topic'
    await channel.assertExchange(exchangeName, 'topic', { durable: true });
    
    // Thiết lập Queue
    const { queue } = await channel.assertQueue(queueName, { durable: true });
    
    // Liên kết Queue với Exchange và các pattern
    await channel.bindQueue(queue, exchangeName, `${routingKey}.created`);
    await channel.bindQueue(queue, exchangeName, `${routingKey}.updated`);
    await channel.bindQueue(queue, exchangeName, `${routingKey}.deleted`);
    
    logger.info('Connected to RabbitMQ');
    
    return { channel, queue };
  } catch (error) {
    logger.error(`RabbitMQ connection error: ${error.message}`);
    throw error;
  }
}

async function closeConnection() {
  try {
    if (channel) await channel.close();
    if (connection) await connection.close();
    logger.info('Disconnected from RabbitMQ');
  } catch (error) {
    logger.error(`Error closing RabbitMQ connection: ${error.message}`);
  }
}

module.exports = {
  connectRabbitMQ,
  closeConnection,
  exchangeName
};
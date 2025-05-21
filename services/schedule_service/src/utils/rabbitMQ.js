const amqp = require('amqplib');
const logger = require('../logger'); // Điều chỉnh đường dẫn nếu cần

const exchangeName = 'cinema_events';
let connection = null;
let channel = null;

// Kết nối đến RabbitMQ
async function connectRabbitMQ() {
  try {
    connection = await amqp.connect('amqp://cinema_app:cinema_password@rabbitmq:5672');
    channel = await connection.createChannel();
    
    // Tạo exchange
    await channel.assertExchange(exchangeName, 'topic', { durable: true });
    
    logger.info('Connected to RabbitMQ');
    return channel;
  } catch (error) {
    logger.error(`RabbitMQ connection error: ${error.message}`);
    throw error;
  }
}

// Đóng kết nối
async function closeConnection() {
  try {
    if (channel) await channel.close();
    if (connection) await connection.close();
    logger.info('Disconnected from RabbitMQ');
  } catch (error) {
    logger.error(`Error closing RabbitMQ connection: ${error.message}`);
  }
}

// Phát sự kiện
async function publishEvent(routingKey, data) {
  try {
    if (!channel) {
      await connectRabbitMQ();
    }
    
    const success = channel.publish(
      exchangeName,
      routingKey,
      Buffer.from(JSON.stringify(data)),
      { persistent: true }
    );
    
    if (success) {
      logger.info(`Published event to ${routingKey}: ${JSON.stringify(data)}`);
    } else {
      logger.warn(`Failed to publish event to ${routingKey}`);
    }
    
    return success;
  } catch (error) {
    logger.error(`Error publishing event: ${error.message}`);
    throw error;
  }
}

module.exports = {
  connectRabbitMQ,
  closeConnection,
  publishEvent
};
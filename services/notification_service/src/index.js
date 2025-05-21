require('dotenv').config();
const { connectRabbitMQ, closeConnection } = require('./config/rabbitmq');
const logger = require('./config/logger');
const { 
  sendScheduleCreatedEmail, 
  sendScheduleUpdatedEmail, 
  sendScheduleDeletedEmail 
} = require('./services/emailService');

// Xử lý message từ RabbitMQ
async function processMessage(msg) {
  try {
    if (!msg) return;
    
    const content = JSON.parse(msg.content.toString());
    const routingKey = msg.fields.routingKey;
    
    logger.info(`Received message with routing key: ${routingKey}`);
    logger.info(`Received content: ${JSON.stringify(content)}`); // Log nội dung nhận được
    
    if (routingKey === 'schedule.created') {
      await sendScheduleCreatedEmail(content);
    } else if (routingKey === 'schedule.updated') {
      await sendScheduleUpdatedEmail(content);
    } else if (routingKey === 'schedule.deleted') {
      // Kiểm tra nội dung message trước khi xử lý
      if (content === null || content === undefined) {
        logger.error('Received null or undefined content for deletion event');
        return;
      }
      
      // Nếu content chỉ là số hoặc chuỗi (ID đơn thuần)
      if (typeof content === 'number' || typeof content === 'string') {
        await sendScheduleDeletedEmail(content); // Truyền ID trực tiếp
      } else if (typeof content === 'object') {
        // Nếu là object có thuộc tính id
        if (content.schedule_id) {
          await sendScheduleDeletedEmail(content);
        } else {
          logger.error('Content object does not have an id property');
        }
      } else {
        logger.error(`Unsupported content type: ${typeof content}`);
      }
    } else {
      logger.warn(`Unknown routing key: ${routingKey}`);
    }
    
  } catch (error) {
    logger.error(`Error processing message: ${error.message}`);
    logger.error(`Error stack: ${error.stack}`);
  }
}

// Khởi động service
async function start() {
  try {
    const { channel, queue } = await connectRabbitMQ();
    
    // Thiết lập consumer
    channel.consume(queue, async (msg) => {
      await processMessage(msg);
      channel.ack(msg);  // Acknowledge message đã xử lý
    });
    
    logger.info('Notification service is running and waiting for messages');
    
    // Xử lý khi đóng ứng dụng
    process.on('SIGINT', async () => {
      await closeConnection();
      process.exit(0);
    });
    
  } catch (error) {
    logger.error(`Failed to start service: ${error.message}`);
    process.exit(1);
  }
}

// Bắt đầu service
start();
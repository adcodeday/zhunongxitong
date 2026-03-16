<template>
  <div class="chat-container">
    <div class="chat-header">
      <h2>AI 助手</h2>
    </div>
    
    <div class="messages-container" ref="messagesContainer">
      <div v-if="messages.length === 0" class="empty-state">
        <div class="empty-icon">💬</div>
        <p>开始与 AI 助手对话吧</p>
      </div>
      
      <div v-for="(message, index) in messages" :key="index" 
           :class="['message', message.role === 'user' ? 'user-message' : 'assistant-message']">
        <div class="message-avatar">
          <div class="avatar-circle" :class="message.role === 'user' ? 'user-avatar' : 'assistant-avatar'">
            {{ message.role === 'user' ? '我' : 'AI' }}
          </div>
        </div>
        <div class="message-content">
          <div class="message-text" v-html="formatMessage(message.content)"></div>
          <div class="message-time">{{ message.time || '刚刚' }}</div>
        </div>
      </div>
      
      <div v-if="isLoading" class="message assistant-message">
        <div class="message-avatar">
          <div class="avatar-circle assistant-avatar">AI</div>
        </div>
        <div class="message-content">
          <div class="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <div class="loading-info">{{ loadingMessage }}</div>
        </div>
      </div>
    </div>
    
    <div class="input-container">
      <textarea 
        v-model="inputMessage" 
        @keydown.enter.prevent="sendMessage"
        placeholder="输入您的问题..." 
        rows="2"
        :disabled="isLoading"
      ></textarea>
      <button @click="sendMessage" :disabled="isLoading || !inputMessage.trim()">
        <span v-if="!isLoading">发送</span>
        <span v-else class="sending">发送中</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch, onUnmounted } from 'vue';
import OpenAI from 'openai';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

const messages = ref([]);
const inputMessage = ref('');
const isLoading = ref(false);
const messagesContainer = ref(null);
const loadingMessage = ref('正在思考中...');
const loadingTimer = ref(null);
const loadingTime = ref(0);
const apiKey = 'sk-4478a000a36f43ec828df825e6a28f30'; // 请确保这是你的有效 API Key

const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: apiKey,
  dangerouslyAllowBrowser: true // 允许在浏览器环境中使用
});

// 格式化消息内容，支持 Markdown
const formatMessage = (content) => {
  // 使用 DOMPurify 清理 HTML 以防止 XSS 攻击
  return DOMPurify.sanitize(marked.parse(content));
};

// 滚动到最新消息
const scrollToBottom = async () => {
  await nextTick();
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

// 监听消息变化，自动滚动到底部
watch(messages, () => {
  scrollToBottom();
}, { deep: true }); // 添加 deep: true 以监听消息内容的变化

const getCurrentTime = () => {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
};

const startLoadingTimer = () => {
  loadingTime.value = 0;
  loadingTimer.value = setInterval(() => {
    loadingTime.value += 1;
    if (loadingTime.value < 5) {
      loadingMessage.value = '正在思考中...';
    } else if (loadingTime.value < 10) {
      loadingMessage.value = '正在生成回答，请稍候...';
    } else if (loadingTime.value < 20) {
      loadingMessage.value = '这个问题需要一点时间，请耐心等待...';
    } else {
      loadingMessage.value = '回答生成中，预计还需几秒钟...';
    }
  }, 1000);
};

const stopLoadingTimer = () => {
  if (loadingTimer.value) {
    clearInterval(loadingTimer.value);
    loadingTimer.value = null;
  }
};

// 尝试方法一：使用标准的流式响应方法
const sendMessage = async () => {
  if (inputMessage.value.trim() === '' || isLoading.value) return;

  const userMessage = { 
    role: 'user', 
    content: inputMessage.value,
    time: getCurrentTime()
  };
  
  messages.value.push(userMessage);
  inputMessage.value = '';
  isLoading.value = true;
  startLoadingTimer();

  try {
    // 创建一个空的助手消息
    const botMessageIndex = messages.value.length;
    const botMessage = { 
      role: 'assistant', 
      content: '',
      time: getCurrentTime()
    };
    messages.value.push(botMessage);

    // 尝试使用流式响应
    try {
      const stream = await openai.chat.completions.create({
        messages: messages.value.slice(0, -1).map(msg => ({ role: msg.role, content: msg.content })),
        model: "deepseek-chat",
        stream: true,
      });

      // 流式接收并更新回复内容
      for await (const chunk of stream) {
        if (chunk.choices[0]?.delta?.content) {
          botMessage.content += chunk.choices[0].delta.content;
          // 强制更新视图
          messages.value = [...messages.value];
        }
      }
    } catch (streamError) {
      console.error('流式响应失败，尝试普通请求:', streamError);
      
      // 如果流式响应失败，回退到普通请求
      const completion = await openai.chat.completions.create({
        messages: messages.value.slice(0, -1).map(msg => ({ role: msg.role, content: msg.content })),
        model: "deepseek-chat",
      });
      
      botMessage.content = completion.choices[0].message.content;
    }
  } catch (error) {
    console.error('请求出错:', error);
    // 如果已经添加了助手消息，则更新它
    if (messages.value.length > 0 && messages.value[messages.value.length - 1].role === 'assistant') {
      messages.value[messages.value.length - 1].content = '请求出错，请稍后再试';
    } else {
      // 否则添加一个新的错误消息
      messages.value.push({ 
        role: 'assistant', 
        content: '请求出错，请稍后再试',
        time: getCurrentTime()
      });
    }
  } finally {
    stopLoadingTimer();
    isLoading.value = false;
  }
};

// 备用方法：如果上面的方法不起作用，可以尝试手动模拟流式响应
const simulateStreamResponse = async (userInput) => {
  const botMessage = { 
    role: 'assistant', 
    content: '',
    time: getCurrentTime()
  };
  messages.value.push(botMessage);
  
  try {
    const completion = await openai.chat.completions.create({
      messages: messages.value.slice(0, -1).map(msg => ({ role: msg.role, content: msg.content })),
      model: "deepseek-chat",
    });
    
    const fullResponse = completion.choices[0].message.content;
    // 模拟流式响应，每20-50ms添加一个字符
    for (let i = 0; i < fullResponse.length; i++) {
      await new Promise(resolve => setTimeout(resolve, Math.random() * 30 + 20));
      botMessage.content += fullResponse[i];
      // 强制更新视图
      messages.value = [...messages.value];
    }
  } catch (error) {
    console.error('请求出错:', error);
    botMessage.content = '请求出错，请稍后再试';
  }
};

onMounted(() => {
  // 初始欢迎消息
  messages.value.push({
    role: 'assistant',
    content: '你好！我是 AI 助手，有什么我可以帮助你的吗？包括农事活动，生产都可以哦！',
    time: getCurrentTime()
  });
});

onUnmounted(() => {
  stopLoadingTimer();
});
</script>

<style scoped lang="scss">
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  min-width: 1200px;
  margin: 0 auto;
  background-color: #f5f7fa;
  border-radius: 10px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-left: -30px;
}

.chat-header {
  background-color: #42b983;
  color: white;
  padding: 15px 20px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  h2 {
    margin: 0;
    font-weight: 500;
  }
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  scroll-behavior: smooth;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #8a9aa9;
  
  .empty-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }
  
  p {
    font-size: 16px;
  }
}

.message {
  display: flex;
  margin-bottom: 20px;
  
  .message-avatar {
    margin-right: 12px;
    
    .avatar-circle {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
    }
    
    .user-avatar {
      background-color: #4a6cf7;
    }
    
    .assistant-avatar {
      background-color: #10b981;
    }
  }
  
  .message-content {
    max-width: 80%;
    
    .message-text {
      padding: 12px 16px;
      border-radius: 18px;
      font-size: 14px;
      line-height: 1.5;
      word-break: break-word;
      
      p {
        margin: 0 0 10px 0;
        
        &:last-child {
          margin-bottom: 0;
        }
      }
      
      pre {
        background-color: #2d3748;
        color: #e2e8f0;
        padding: 12px;
        border-radius: 6px;
        overflow-x: auto;
        font-family: 'Courier New', monospace;
        margin: 10px 0;
      }
      
      code {
        font-family: 'Courier New', monospace;
        background-color: rgba(0, 0, 0, 0.05);
        padding: 2px 4px;
        border-radius: 3px;
      }
    }
    
    .message-time {
      font-size: 12px;
      color: #8a9aa9;
      margin-top: 4px;
    }
  }
  
  &.user-message {
    flex-direction: row-reverse;
    
    .message-avatar {
      margin-right: 0;
      margin-left: 12px;
    }
    
    .message-content {
      .message-text {
        background-color: #4a6cf7;
        color: white;
        border-bottom-right-radius: 4px;
      }
      
      .message-time {
        text-align: right;
      }
    }
  }
  
  &.assistant-message {
    .message-content {
      .message-text {
        background-color: white;
        color: #333;
        border-bottom-left-radius: 4px;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
      }
    }
  }
}

.typing-indicator {
  display: flex;
  align-items: center;
  background-color: white;
  padding: 12px 16px;
  border-radius: 18px;
  border-bottom-left-radius: 4px;
  
  span {
    height: 8px;
    width: 8px;
    margin: 0 2px;
    background-color: #8a9aa9;
    border-radius: 50%;
    display: inline-block;
    animation: typing 1.4s infinite ease-in-out both;
    
    &:nth-child(1) {
      animation-delay: 0s;
    }
    
    &:nth-child(2) {
      animation-delay: 0.2s;
    }
    
    &:nth-child(3) {
      animation-delay: 0.4s;
    }
  }
}

.loading-info {
  font-size: 12px;
  color: #8a9aa9;
  margin-top: 8px;
  text-align: center;
}

@keyframes typing {
  0% {
    transform: scale(1);
    opacity: 0.4;
  }
  20% {
    transform: scale(1.2);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0.4;
  }
}

.input-container {
  display: flex;
  padding: 15px;
  background-color: white;
  border-top: 1px solid #e5e7eb;
  
  textarea {
    flex: 1;
    border: 1px solid #d1d5db;
    border-radius: 20px;
    padding: 12px 16px;
    font-size: 14px;
    resize: none;
    outline: none;
    transition: border-color 0.2s;
    
    &:focus {
      border-color: #4a6cf7;
    }
    
    &:disabled {
      background-color: #f9fafb;
      cursor: not-allowed;
    }
  }
  
  button {
    margin-left: 10px;
    background-color: #4a6cf7;
    color: white;
    border: none;
    border-radius: 20px;
    padding: 0 20px;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.2s;
    
    &:hover {
      background-color: #3a5ce5;
    }
    
    &:disabled {
      background-color: #9ca3af;
      cursor: not-allowed;
    }
    
    .sending {
      opacity: 0.8;
    }
  }
}
</style>
package com.openai.pocProject.service;

import com.openai.pocProject.dto.ChatGPTRequest;
import com.openai.pocProject.dto.ChatGPTResponse;
import com.openai.pocProject.entity.ChatMessage;
import com.openai.pocProject.repository.ChatMessageRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ChatGPTService {

    private final RestClient restClient;
    private final ChatMessageRepository messageRepo;

    @Value("${azure.openai.api.key}")
    private String apiKey;

    @Value("${azure.openai.api.model}")
    private String model;

    @Value("${azure.openai.api.url}")
    private String apiUrl;

    public ChatGPTService(RestClient restClient, ChatMessageRepository messageRepo) {
        this.restClient = restClient;
        this.messageRepo = messageRepo;
    }

    public String getChatResponse(String userMessage, UUID chatId) {
        // Save user message
        messageRepo.save(new ChatMessage(chatId, "user", userMessage));

        // Fetch chat history
        List<ChatGPTRequest.Message> messages = messageRepo.findByChatIdOrderByTimestampAsc(chatId)
                .stream()
                .map(msg -> new ChatGPTRequest.Message("user", msg.getContent()))
                .collect(Collectors.toList());

        if (messages.isEmpty()) {
            messages.add(new ChatGPTRequest.Message("user", userMessage));  // fallback
        }

        ChatGPTRequest chatGPTRequest = new ChatGPTRequest(
                model,
                messages
        );

        // DEBUG: Log outgoing request
        System.out.println("👉 Calling Azure OpenAI...");
        System.out.println("🔹 API URL: " + apiUrl);
        System.out.println("🔹 API Key: " + apiKey);
        System.out.println("🔹 Model: " + model);
        System.out.println("🔹 Request Body: " + chatGPTRequest);

        try {
            ChatGPTResponse response = restClient.post()
                    .uri(apiUrl)
                    .header("api-key", apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(chatGPTRequest)
                    .retrieve()
                    .body(ChatGPTResponse.class);

            if (response == null || response.choices().isEmpty()) {
                System.out.println("⚠ No response or empty choices from Azure OpenAI");
                return "Azure OpenAI returned no response.";
            }

            String botReply = response.choices().get(0).message().content();

            // Save bot reply
            messageRepo.save(new ChatMessage(chatId, "assisstant", botReply));

            return botReply;

        } catch (Exception e) {
            System.out.println("❌ Error calling Azure OpenAI:");
            e.printStackTrace();
            return "Error calling Azure OpenAI: " + e.getMessage();
        }
    }
    public List<ChatMessage> getAllMessages(UUID chatId) {
        return messageRepo.findByChatIdOrderByTimestampAsc(chatId);
    }
}
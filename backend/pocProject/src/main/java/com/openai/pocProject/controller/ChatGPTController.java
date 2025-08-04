package com.openai.pocProject.controller;

import com.openai.pocProject.dto.PromptRequest;
import com.openai.pocProject.entity.ChatMessage;
import com.openai.pocProject.service.ChatGPTService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*")
public class ChatGPTController {

    private final ChatGPTService chatGPTService;

    @Autowired
    public ChatGPTController(ChatGPTService chatGPTService) {
        this.chatGPTService = chatGPTService;
    }

    @PostMapping
    public ResponseEntity<String> getChatResponse(@RequestBody PromptRequest promptRequest) {
        try {
            String response = chatGPTService.getChatResponse( promptRequest.prompt(),promptRequest.chatId());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }
    @GetMapping("/{chatId}")
    public ResponseEntity<List<ChatMessage>> getChatHistory(@PathVariable UUID chatId) {
        return ResponseEntity.ok(chatGPTService.getAllMessages(chatId));
    }
}
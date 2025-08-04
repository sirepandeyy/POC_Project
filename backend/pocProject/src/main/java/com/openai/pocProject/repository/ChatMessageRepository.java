package com.openai.pocProject.repository;

import com.openai.pocProject.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long>{
    List<ChatMessage> findByChatIdOrderByTimestampAsc(UUID chatId);
}

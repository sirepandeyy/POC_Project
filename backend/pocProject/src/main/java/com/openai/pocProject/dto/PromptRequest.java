package com.openai.pocProject.dto;

import java.util.UUID;

public record PromptRequest(UUID chatId, String prompt) {
}

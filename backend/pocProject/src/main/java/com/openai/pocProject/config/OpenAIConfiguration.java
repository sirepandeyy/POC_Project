package com.openai.pocProject.config;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;
import org.springframework.http.HttpHeaders;

@Configuration
public class OpenAIConfiguration {

    @Value("${azure.openai.api.url}")
    private String apiUrl;

    @Value("${azure.openai.api.key}")
    private String apiKey;

    @Bean
    public RestClient restClient() {
        return RestClient.builder()
                .baseUrl(apiUrl)
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                .defaultHeader("api-key", apiKey) // Required by Azure
                .build();
    }
}

package quest.gekko.stella.audiotranscriber.config;

import org.springframework.ai.openai.OpenAiAudioTranscriptionModel;
import org.springframework.ai.openai.api.OpenAiAudioApi;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenAiConfig {

    @Bean
    public OpenAiAudioApi openAiAudioApi(@Value("${spring.ai.openai.api-key}") final String apiKey) {
        return new OpenAiAudioApi(apiKey);
    }

    @Bean
    public OpenAiAudioTranscriptionModel transcriptionModel(final OpenAiAudioApi openAiAudioApi) {
        return new OpenAiAudioTranscriptionModel(openAiAudioApi);
    }

}

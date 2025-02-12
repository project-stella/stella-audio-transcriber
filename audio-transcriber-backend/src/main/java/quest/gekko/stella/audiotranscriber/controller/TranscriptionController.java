package quest.gekko.stella.audiotranscriber.controller;

import org.springframework.ai.audio.transcription.AudioTranscriptionPrompt;
import org.springframework.ai.audio.transcription.AudioTranscriptionResponse;
import org.springframework.ai.openai.OpenAiAudioTranscriptionModel;
import org.springframework.ai.openai.OpenAiAudioTranscriptionOptions;
import org.springframework.ai.openai.api.OpenAiAudioApi;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;

@RestController
@RequestMapping("/api/transcribe")
public class TranscriptionController {
    private final OpenAiAudioTranscriptionModel transcriptionModel;

    public TranscriptionController(final OpenAiAudioTranscriptionModel transcriptionModel) {
        this.transcriptionModel = transcriptionModel;
    }

    @PostMapping
    public ResponseEntity<String> transcribeAudio(@RequestParam("file") final MultipartFile file) {
        if (file.isEmpty()) {
            return new ResponseEntity<>("No file uploaded.", HttpStatus.BAD_REQUEST);
        }

        final String contentType = file.getContentType();

        File temporaryFile = null;
        try {
            temporaryFile = File.createTempFile("audio", contentType);
            file.transferTo(temporaryFile);

            OpenAiAudioTranscriptionOptions transcriptionOptions = OpenAiAudioTranscriptionOptions.builder()
                    .responseFormat(OpenAiAudioApi.TranscriptResponseFormat.TEXT)
                    .language("en")
                    .temperature(0F)
                    .build();

            final FileSystemResource audioFile = new FileSystemResource(temporaryFile);
            final AudioTranscriptionPrompt transcriptionPrompt = new AudioTranscriptionPrompt(audioFile, transcriptionOptions);
            final AudioTranscriptionResponse transcriptionResponse = transcriptionModel.call(transcriptionPrompt);

            return new ResponseEntity<>(transcriptionResponse.getResult().getOutput(), HttpStatus.OK);
        } catch (final IOException ex) {
            return new ResponseEntity<>("An error occurred while processing the file.", HttpStatus.INTERNAL_SERVER_ERROR);
        } finally {
            if (temporaryFile != null && temporaryFile.exists()) {
                if (!temporaryFile.delete()) {
                    System.out.println("Failed to delete temporary file: " + temporaryFile.getAbsolutePath());
                }
            }
        }
    }
}

package com.wissen.ims.service;

import org.apache.tika.Tika;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;

@Service
public class ResumeParsingService {

    private final Tika tika = new Tika();

    public String extractText(MultipartFile file) throws IOException {
        try (InputStream stream = file.getInputStream()) {
            return tika.parseToString(stream);
        } catch (Exception e) {
            throw new IOException("Failed to parse resume: " + e.getMessage());
        }
    }
}

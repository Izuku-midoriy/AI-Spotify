package com.moodai.backend;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
public class MoodController {

    @PostMapping("/detectMood")
    public ResponseEntity<Map<String, String>> detectMood(@RequestBody Map<String, String> request) {
        String text = request.get("text");

        String mood = "happy"; // stub
        String playlistUrl = "https://open.spotify.com/embed/playlist/37i9dQZF1DXdPec7aLTmlC"; // stub

        Map<String, String> response = new HashMap<>();
        response.put("mood", mood);
        response.put("playlistUrl", playlistUrl);

        return ResponseEntity.ok(response);
    }
}

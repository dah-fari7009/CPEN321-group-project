package com.example.eloquent;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

public class User {
    private String userID;
    private String username;
    private Presentation[] presentations;
    private String[] presentationTitles;

    private static User self;

    public static User getInstance(String userJSON) {
        if (self == null) {
            ObjectMapper objectMapper = new ObjectMapper();
            try {
                self = objectMapper.readValue(userJSON, User.class);
            } catch (JsonProcessingException e) {
                e.printStackTrace();
            }
        }
        return self;
    }

    public String getUserID() {
        return userID;
    }

    public String getUsername() {
        return username;
    }

    public Presentation[] getPresentations() {
        return presentations;
    }
}

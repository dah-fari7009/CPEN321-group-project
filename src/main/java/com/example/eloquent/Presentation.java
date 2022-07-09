package com.example.eloquent;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

public class Presentation {
    private String title;
    private int presentationID;
    private Cards[] cueCards;
    private Feedback[] feedback;

    public Presentation(String title, int presentationID) {
        this.title = title;
        this.presentationID = presentationID;
    }

    ObjectMapper objectMapper = new ObjectMapper();
    String json = "{ \"title\" : \"Keyword\", \"Cards\" : \"[\"sdadsad\",\"sdadsad\",\"sdadsad\",\"sdadsad\"]\" }";
    Presentation presentation;

    {
        try {
            presentation = objectMapper.readValue(json, Presentation.class);
        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }
    }


}

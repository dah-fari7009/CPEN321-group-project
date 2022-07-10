package com.example.eloquent;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

public class Presentation {
    private String title;
    private int presentationID;
    private Cards[] cueCards;
    private Feedback[] feedback;

    public String getTitle() {
        return title;
    }

    public int getPresentationID() {
        return presentationID;
    }

    public Cards[] getCueCards() {
        return cueCards;
    }

    public Feedback[] getFeedback() {
        return feedback;
    }



}

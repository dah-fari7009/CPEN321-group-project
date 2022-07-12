package com.example.eloquent;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.Serializable;
import java.util.ArrayList;

public class Presentation implements Serializable {
    public String title;
    public int presentationID;
    public ArrayList<Cards> cueCards;
    public ArrayList<Feedback> feedback;

    public Presentation(String title, int presentationID) {
        this.title = title;
        this.presentationID = presentationID;
        this.cueCards = new ArrayList<>();
        this.feedback = new ArrayList<>();
    }

    public Presentation(String title) {
        this.title = title;
        this.cueCards = new ArrayList<>();
        this.feedback = new ArrayList<>();
    }

    public Presentation() {
        this.cueCards = new ArrayList<>();
        this.feedback = new ArrayList<>();
    }

    public Cards getCards(int index){
        return cueCards.get(index);
    }

    public String getTitle(){
        return title;
    }

    private int getPresentationID(){
        return presentationID;
    }

    public Feedback getFeedback(int index) {
        return feedback.get(index);
    }

    public void setPresentationID(int presentationID) {
        this.presentationID = presentationID;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setCueCards(Cards cueCards, int index) {
        this.cueCards.set(index,cueCards);
    }

    public void setFeedback(Feedback feedback,int index) {
        this.feedback.set(index, feedback);
    }
}

package com.example.eloquent;


import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.io.Serializable;
import java.util.ArrayList;

@JsonIgnoreProperties(ignoreUnknown = true)
public class Presentation implements Serializable {
    public String title;
    @JsonProperty("_id")
    public String presentationID;
    @JsonProperty("cards")
    public ArrayList<Cards> cueCards;
    public ArrayList<Feedback> feedback;

    public Presentation(String title, String presentationID) {
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

//    private String getPresentationID(){
//        return presentationID;
//    }

    public Feedback getFeedback(int index) {
        return feedback.get(index);
    }

    public void setPresentationID(String presentationID) {
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

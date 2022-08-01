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

    // Flags for edits
    private boolean isTitleChanged;

    public Presentation(String title, String presentationID, Cards card1, Cards card2, Cards card3) {
        this.title = title;
        this.presentationID = presentationID;
        this.cueCards = new ArrayList<>();
        cueCards.add(card1);
        cueCards.add(card2);
        cueCards.add(card3);
        this.feedback = new ArrayList<>();

        isTitleChanged = false;
    }

    public Presentation(String title, String presentationID, ArrayList<Cards> cueCards) {
        this.title = title;
        this.presentationID = presentationID;
        this.cueCards = cueCards;
        this.feedback = new ArrayList<>();

        this.isTitleChanged = false;
    }

    public Presentation(String title, String presentationID) {
        this.title = title;
        this.presentationID = presentationID;
        this.cueCards = new ArrayList<>();
        this.feedback = new ArrayList<>();

        this.isTitleChanged = false;
    }

    public Presentation(String title) {
        this.title = title;
        this.cueCards = new ArrayList<>();
        this.feedback = new ArrayList<>();

        this.isTitleChanged = false;
    }

    public Presentation() {
        this.cueCards = new ArrayList<>();
        this.feedback = new ArrayList<>();

        this.isTitleChanged = false;
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

    public boolean getIsTitleChanged() {
        return this.isTitleChanged;
    };

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

    public void setIsTitleChanged(boolean isChanged) {
        this.isTitleChanged = isChanged;
    }
}

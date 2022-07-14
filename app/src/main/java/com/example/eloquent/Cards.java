package com.example.eloquent;

import java.io.Serializable;


public class Cards implements Serializable {

    public Front front;
    public Back back;
    public int background_colour;
    public String transitionPhrase;
    public int endWithPause;

    public Cards(int backgroundColour, String transitionPhrase, int endWithPause, Front front, Back back) {
        this.background_colour = backgroundColour;
        this.transitionPhrase = transitionPhrase;
        this.endWithPause = endWithPause;
        this.front = front;
        this.back = back;
    }

    public Cards(Front front, Back back, int background_colour) {
        this.front = front;
        this.back = back;
        this.background_colour = background_colour;
    }

    public Front getFront() {
        return front;
    }

    public Back getBack() {
        return back;
    }

    public int getBackground_color() {
        return background_colour;
    }

    public void setFront(Front front) {
        this.front = front;
    }

    public void setBack(Back back) {
        this.back = back;
    }

    public void setBackground_colour(int background_colour) {
        this.background_colour = background_colour;
    }
}

package com.example.eloquent;

public class Cards {

    private Front front;
    private Back back;
    private int background_colour;

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
}

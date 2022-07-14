package com.example.eloquent;

import java.io.Serializable;

public class Front implements Serializable {
    public int backgroundColor;
    public Content[] content;

    public Front(int backgroundColour, Content[] content) {
        this.backgroundColor = backgroundColour;
        this.content = content;
    }

    public Front(int backgroundColor) {

        this.backgroundColor = backgroundColor;
        this.content = new Content[1];
    }

    // empty constructor for Jackson
    public Front() {}

    public int getBackgroundColor() {return backgroundColor;}

    public Content getContent(int index) {return content[index]; }

    public void setBackgroundColor(int backgroundColor) {
        this.backgroundColor = backgroundColor;
    }

    public void setContent(Content content, int index) {
        this.content[index] = content;
    }
}

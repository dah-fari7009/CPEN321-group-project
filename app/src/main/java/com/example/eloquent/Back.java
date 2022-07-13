package com.example.eloquent;

import java.io.Serializable;

public class Back implements Serializable {
    public int background_color;
    public Content[] content;

    public Back(int backgroundColour, Content[] content) {
        this.background_color = backgroundColour;
        this.content = content;
    }

    public Back(int background_color) {
        this.background_color = background_color;
        this.content = new Content[1];
    }

    public int getBackground_color() {return background_color;}

    public Content getContent(int index) {return content[index]; }

    public void setBackground_color(int background_color) {
        this.background_color = background_color;
    }

    public void setContent(Content content, int index) {
        this.content[index] = content;
    }
}

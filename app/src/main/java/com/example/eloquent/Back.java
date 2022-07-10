package com.example.eloquent;

public class Back {
    public int background_color;
    public Content[] content;

    public Back(int background_color) {
        this.background_color = background_color;
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

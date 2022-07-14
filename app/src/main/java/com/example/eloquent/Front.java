package com.example.eloquent;

public class Front {
    public int background_color;
    public Content content;

    public Front(int background_color, Content content) {
        this.background_color = background_color;
        this.content = content;
    }

    public Front(int background_color) {
        this.background_color = background_color;
        this.content = new Content();
    }

    public int getBackground_color() {return background_color;}

    public Content getContent() {return content; }

    public void setBackground_color(int background_color) {
        this.background_color = background_color;
    }

    public void setContent(Content content, int index) {
        this.content = content;
    }
}

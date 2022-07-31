package com.example.eloquent;

public class History {
    private String recent_text;
    private String before_text;
    private String userID;


    public History(String recent_text, String before_text, String userID) {
        this.recent_text = recent_text;
        this.before_text = before_text;
        this.userID = userID;
    }

    public String getRecent_text() {
        return recent_text;
    }

    public String getBefore_text() {
        return before_text;
    }

    public String getUserID() {
        return userID;
    }
}
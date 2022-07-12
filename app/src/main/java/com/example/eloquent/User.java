package com.example.eloquent;

public class User {
    private String userID;
    private String username;
    private Presentation[] presentations;

    private static User self;

    public static User getInstance() {
        if (self == null)
            self = new User();

        return self;
    }

    public String getUserID() {
        return userID;
    }

    public String getUsername() {
        return username;
    }

    public Presentation[] getPresentations() {
        return presentations;
    }
}

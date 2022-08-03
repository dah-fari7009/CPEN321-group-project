package com.example.eloquent;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.io.Serializable;

@JsonIgnoreProperties(ignoreUnknown = true)
public class PresentationMember implements Serializable {
    private String id;
    private String permission;

    // empty constructor for Jackson
    public PresentationMember() {}

    // getters
    public String getId() {
        return id;
    }

    public String getPermission() {
        return permission;
    }

    // setters
    public void setId(String id) {
        this.id = id;
    }

    public void setPermission(String permission) {
        this.permission = permission;
    }
}

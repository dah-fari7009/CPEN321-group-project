package com.example.eloquent;

import android.telephony.IccOpenLogicalChannelResponse;

public class Content {
    public int color;
    public String message;

    public Content(int color, String message){
        this.color= color;
        this.message = message;
    }

    public int getColor() {return color;}

    public String getMessage() {return message; }

    public void setColor(int color) {
        this.color = color;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}

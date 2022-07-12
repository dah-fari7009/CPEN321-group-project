package com.example.eloquent;

import android.content.Context;
import android.util.Log;
import android.widget.Toast;

import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.DiskBasedCache;
import com.android.volley.toolbox.HurlStack;
import com.android.volley.toolbox.StringRequest;
import com.android.volley.toolbox.Volley;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.HashMap;
import java.util.Map;

public class Router {

    private static RequestQueue requestQueue;
    private static Router self;

    private static String TAG = "Router";
    private static String BACKEND_HOST_AND_PORT = "http://20.104.77.70:8081";

    public static Router getInstance(Context applicationContext) {
        if (self == null) {
            self = new Router();
            requestQueue = Volley.newRequestQueue(applicationContext);
        }
        return self;
    }

    public void createUser(String IdToken, String userID, String username) {
        ObjectMapper objectMapper = new ObjectMapper();
        String url = BACKEND_HOST_AND_PORT + "/api/login";
        StringRequest stringRequest = new StringRequest(Request.Method.PUT, url, new Response.Listener<String>() {
            @Override
            public void onResponse(String response) {
                Log.d(TAG, response);
                User user = User.getInstance(response);
                Log.d(TAG, user.getUserID() + " " + user.getUsername());
            }
        }, new Response.ErrorListener() {
            @Override
            public void onErrorResponse(VolleyError error) {
                Log.d(TAG,error.toString());
            }
        }) {
            @Override
            protected Map<String, String> getParams() {
                Map<String, String> params = new HashMap<String, String>();
                params.put("token", IdToken);
                params.put("userID", userID);
                params.put("username", username);
                return params;
            }
            @Override
            public Map<String, String> getHeaders() {
                Map<String, String> headers = new HashMap<String, String>();
                headers.put("Content-Type", "application/x-www-form-urlencoded");
                return headers;
            }
        };

        requestQueue.add(stringRequest);
    }

    public void createEmptyPresentation() {
        String url = BACKEND_HOST_AND_PORT + "api/presentation";
        StringRequest stringRequest = new StringRequest(Request.Method.POST, url, new Response.Listener<String>() {
            @Override
            public void onResponse(String response) {
                Log.d(TAG, response);
            }
        }, new Response.ErrorListener() {
            @Override
            public void onErrorResponse(VolleyError error) {
                Log.d(TAG,error.toString());
            }
        });
    }
}

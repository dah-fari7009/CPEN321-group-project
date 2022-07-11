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

public class Router {

    private static RequestQueue requestQueue;
    private static Router self;
    private static String TAG = "Router";

    public static Router getInstance(Context applicationContext) {
        if (self == null) {
            self = new Router();
            requestQueue = Volley.newRequestQueue(applicationContext);
        }
        return self;
    }

    public void createUser(String id) {
        User user = User.getInstance();
        StringRequest stringRequest = new StringRequest(Request.Method.GET, "http://20.104.77.70:8081/", new Response.Listener<String>() {
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

        requestQueue.add(stringRequest);
    }
}

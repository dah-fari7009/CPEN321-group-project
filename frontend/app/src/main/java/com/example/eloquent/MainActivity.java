package com.example.eloquent;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.SearchView;
import androidx.appcompat.widget.Toolbar;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.Menu;
import android.view.MenuInflater;
import android.view.MenuItem;

import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.StringRequest;
import com.android.volley.toolbox.Volley;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.json.JSONArray;
import org.json.JSONException;

import java.util.ArrayList;

public class MainActivity extends AppCompatActivity implements Adapter.OnPresListener {


    private RecyclerView recyclerView;
    ArrayList<Presentation> presentations;
    Adapter adapter;
    private String BACKEND_HOST_AND_PORT = "http://20.104.77.70:8081";
    private static RequestQueue requestQueue;

    private String TAG = "MainActivity";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        /* Set up toolbar */
        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);

        /* Set up for sending HTTP requests */
        requestQueue = Volley.newRequestQueue(getApplicationContext());

        recyclerView = findViewById(R.id.listOfPres);
        presentations = new ArrayList<>();
        adapter = new Adapter(this, presentations, this::selectedPres);

        // put here to test the add functionality
//        passedPres = (Presentation) getIntent().getSerializableExtra("Presentation");
//        if(passedPres != null) {
//            Log.d(TAG, passedPres.getTitle());
//            presentations.add(passedPres);
//        }

        getAllPresentationsOfUser(User.getInstance().getData().getUserID(), presentations);
    }

    private void showPresentations() {
        recyclerView.setLayoutManager(new LinearLayoutManager(getApplicationContext()));
        recyclerView.setAdapter(adapter);
    }


    @Override
    public boolean onOptionsItemSelected(@NonNull MenuItem item) {
        if(item.getItemId() == R.id.add) {
            Intent addPres = new Intent(this, AddPres.class);
            startActivity(addPres);
        }
        if(item.getItemId() == R.id.search) {
            return true;
        }
        return super.onOptionsItemSelected(item);
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {

        MenuInflater inflater = getMenuInflater();
        inflater.inflate(R.menu.add_menu, menu);
        getMenuInflater().inflate(R.menu.add_menu, menu);
        MenuItem menuitem = menu.findItem(R.id.search);
        SearchView searchView = (SearchView) menuitem.getActionView();
        searchView.setMaxWidth(Integer.MAX_VALUE);


        searchView.setOnQueryTextListener(new SearchView.OnQueryTextListener() {
            @Override
            public boolean onQueryTextSubmit(String query) {
                return false;
            }
            @Override
            public boolean onQueryTextChange(String newText) {
                adapter.getFilter().filter(newText);
                return false;
            }
        });

        return super.onCreateOptionsMenu(menu);
    }


    @Override
    public void selectedPres(Presentation presentation) {
        Intent intent = new Intent(this, EditPres.class);
        intent.putExtra("Presentation", presentation);
        startActivity(intent);
    }

    private void getAllPresentationsOfUser(String userID, ArrayList<Presentation> presCollection) {
        String url = BACKEND_HOST_AND_PORT + "/api/allPresentationsOfUser?userID=" + userID;
        StringRequest stringRequest = new StringRequest(Request.Method.GET, url, new Response.Listener<String>() {
            @Override
            public void onResponse(String response) {
                Log.d(TAG, User.getInstance().getData().getUsername() + " " + User.getInstance().getData().getUserID());
                Log.d(TAG, response);
                JSONArray presentations;
                try {
                    presentations = new JSONArray(response);
                } catch (JSONException e) {
                    presentations = null;
                    e.printStackTrace();
                }
                if (presentations != null) {
                    for (int i = 0; i < presentations.length(); i++) {
                        String pres;
                        Presentation p;
                        ObjectMapper objectMapper = new ObjectMapper();
                        try {
                            pres = presentations.getJSONObject(i).toString();
                        } catch (JSONException e) {
                            pres = null;
                            e.printStackTrace();
                        }
                        try {
                            p = objectMapper.readValue(pres, Presentation.class);
                        } catch (JsonProcessingException e) {
                            p = null;
                            e.printStackTrace();
                        }
                        if (p != null) {
                            presCollection.add(p);
                        }
                    }
                }

                // sanity check
//                Log.d(TAG, presCollection.get(7).title);
//                Log.d(TAG, presCollection.get(7).cueCards.get(0).front.content.message);
//                Log.d(TAG, presCollection.get(7).feedback.toString());
//                Log.d(TAG, String.valueOf(presCollection.get(7).presentationID));

                showPresentations();
            }
        }, new Response.ErrorListener() {
            @Override
            public void onErrorResponse(VolleyError error) {
                Log.d(TAG, error.toString());
            }
        });

        requestQueue.add(stringRequest);
    }
}
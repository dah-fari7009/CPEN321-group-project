package com.example.eloquent;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.SearchView;
import androidx.appcompat.widget.Toolbar;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import android.content.Intent;
import android.os.Bundle;
import android.os.Parcelable;
import android.util.Log;
import android.view.Menu;
import android.view.MenuInflater;
import android.view.MenuItem;
import android.view.View;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.ListView;
import android.widget.Toast;

import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.JsonArrayRequest;
import com.android.volley.toolbox.Volley;
import com.google.gson.Gson;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.net.URL;
import java.util.ArrayList;
import java.util.List;

public class MainActivity extends AppCompatActivity implements Adapter.OnPresListener {

    private Toolbar toolbar;
    private RecyclerView recyclerView;
    List<Presentation> presentations;
    private String url = "http://20.104.77.70:8081/";
    // private ListView listView;
    // String[] name = {"Alice", "Bob", "Cathy", "Cherry", "Chritopher", "Dog", "Eddy"};
    Adapter adapter;
   // ArrayAdapter<String> arrayAdapter;
    private Button test;
    Presentation presentation = new Presentation("test1");
    Presentation presentation2 = new Presentation("test2");
    Presentation passedPres;
    private String TAG = "MainActivity.this";


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);


        toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);

        recyclerView = findViewById(R.id.listOfPres);
        presentations = new ArrayList<>();
        extractPresentations();

        // put here to test the add functionality
        passedPres = (Presentation) getIntent().getSerializableExtra("Presentation");
        if(passedPres != null) {
            Log.d(TAG, passedPres.getTitle());
            presentations.add(passedPres);
        }

        showPresentation();



        test = findViewById(R.id.button2);
        test.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent presentingIntent = new Intent(MainActivity.this, Presenting.class);
                startActivity(presentingIntent);
            }
        });

//        listView = findViewById(R.id.listView);
//        arrayAdapter = new ArrayAdapter<String>(this, android.R.layout.simple_list_item_1, name);
//        listView.setAdapter(arrayAdapter);
    }

    private void showPresentation() {

        presentations.add(presentation);
        presentations.add(presentation2);
        recyclerView.setLayoutManager(new LinearLayoutManager(getApplicationContext()));
        adapter = new Adapter(getApplicationContext(), presentations, this::OnPresClick);
        recyclerView.setAdapter(adapter);
    }

    private void extractPresentations() {
        RequestQueue queue = Volley.newRequestQueue(this);
        JsonArrayRequest jsonArrayRequest = new JsonArrayRequest(Request.Method.GET, url, null, new Response.Listener<JSONArray>() {
            @Override
            public void onResponse(JSONArray response) {
                for (int i = 0; i < response.length(); i++) {
                    try {
                        JSONObject presentationObject = response.getJSONObject(i);

                        Presentation presentation = new Presentation();
                        presentation.setTitle(presentationObject.getString("title").toString());
                        presentations.add(presentation);

                    } catch (JSONException e) {
                        e.printStackTrace();
                    }
                }

                recyclerView.setLayoutManager(new LinearLayoutManager(getApplicationContext()));
                //adapter = new Adapter(getApplicationContext(), presentations, this);
                recyclerView.setAdapter(adapter);
            }
        }, new Response.ErrorListener() {
            @Override
            public void onErrorResponse(VolleyError error) {
                Log.d("tag", "onErrorResponse: " + error.getMessage());
            }
        });

        queue.add(jsonArrayRequest);
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        MenuInflater inflater = getMenuInflater();
        inflater.inflate(R.menu.add_menu, menu);
        getMenuInflater().inflate(R.menu.add_menu, menu);
        MenuItem menuitem = menu.findItem(R.id.search);
        SearchView searchView = (SearchView) menuitem.getActionView();
        searchView.setQueryHint("Type here to search");

        searchView.setOnQueryTextListener(new SearchView.OnQueryTextListener() {
            @Override
            public boolean onQueryTextSubmit(String query) {
                return false;
            }

            @Override
            public boolean onQueryTextChange(String newText) {

                //arrayAdapter.getFilter().filter(newText);
                return false;
            }
        });
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(@NonNull MenuItem item) {
        if(item.getItemId() == R.id.add) {
            Intent addPres = new Intent(this, AddPres.class);
            startActivity(addPres);
            Toast.makeText(this, "Add btt is clicked", Toast.LENGTH_SHORT).show();
        }
        if(item.getItemId() == R.id.search) {

        }
        return super.onOptionsItemSelected(item);
    }

    @Override
    public void OnPresClick(int position) {
        Presentation pres = presentations.get(position);
        Intent intent = new Intent(this, EditPres.class);
        intent.putExtra("Presentation", pres);
        startActivity(intent);
    }
}
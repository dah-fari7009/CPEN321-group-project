package com.example.eloquent;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.android.volley.Response;

import org.json.JSONArray;

import java.util.List;

public class Adapter extends RecyclerView.Adapter<Adapter.ViewHolder> {
    LayoutInflater inflater;
    List<Presentation> presentations;
    OnPresListener mOnPresListener;

    public Adapter(Context ctx, List<Presentation> presentations, OnPresListener onPresListener){
        this.inflater = LayoutInflater.from(ctx);
        this.presentations = presentations;
        this.mOnPresListener = onPresListener;
    }


    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = inflater.inflate(R.layout.custom_list_layout,parent,false);
        return new ViewHolder(view,mOnPresListener);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        // bind the data
        holder.presentationTitle.setText(presentations.get(position).getTitle());

    }

    @Override
    public int getItemCount() {
        return presentations.size();
    }



    public  class ViewHolder extends RecyclerView.ViewHolder implements View.OnClickListener{
        TextView presentationTitle;
        OnPresListener onPresListener;

        public ViewHolder(@NonNull View itemView, OnPresListener onPresListener) {
            super(itemView);

            presentationTitle = itemView.findViewById(R.id.presentationTitle);
            this.onPresListener = onPresListener;

            itemView.setOnClickListener(this);

        }

        @Override
        public void onClick(View v) {

        }
    }

    public interface OnPresListener {
        void OnPresClick(int position);
    }
}

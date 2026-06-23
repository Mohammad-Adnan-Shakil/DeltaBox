package com.deltabox.backend.dto;

import com.fasterxml.jackson.annotation.JsonAlias;

public class FavoriteDriverRequest {

    @JsonAlias("favouriteDriver")
    private String favoriteDriver;

    public FavoriteDriverRequest() {}

    public FavoriteDriverRequest(String favoriteDriver) {
        this.favoriteDriver = favoriteDriver;
    }

    public String getFavoriteDriver() {
        return favoriteDriver;
    }

    public void setFavoriteDriver(String favoriteDriver) {
        this.favoriteDriver = favoriteDriver == null ? null : favoriteDriver.trim().toUpperCase();
    }
}

package com.deltabox.backend.service;

import com.deltabox.backend.dto.UserResponse;
import com.deltabox.backend.dto.UserSummaryResponse;

import java.util.List;

public interface UserService {

    UserResponse getCurrentUser(String email);

    List<UserSummaryResponse> getAllUsers(int page, int size);
}

package com.deltabox.backend.service.impl;

import com.deltabox.backend.dto.UserResponse;
import com.deltabox.backend.dto.UserSummaryResponse;
import com.deltabox.backend.exception.UserNotFoundException;
import com.deltabox.backend.model.User;
import com.deltabox.backend.repository.UserRepository;
import com.deltabox.backend.service.UserService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    public UserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserResponse getCurrentUser(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        return new UserResponse(
                user.getEmail(),
                user.getRole()
        );
    }

   @Override
public List<UserSummaryResponse> getAllUsers(int page, int size) {

    Pageable pageable = PageRequest.of(page, size);

    Page<User> userPage = userRepository.findAll(pageable);

    return userPage.getContent()
            .stream()
            .map(user -> new UserSummaryResponse(
                    user.getEmail(),
                    user.getRole()
            ))
            .toList();
}
}

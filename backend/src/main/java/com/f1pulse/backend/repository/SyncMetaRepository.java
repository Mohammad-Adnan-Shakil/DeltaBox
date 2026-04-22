package com.deltabox.backend.repository;

import com.deltabox.backend.model.SyncMeta;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SyncMetaRepository extends JpaRepository<SyncMeta, String> {
}

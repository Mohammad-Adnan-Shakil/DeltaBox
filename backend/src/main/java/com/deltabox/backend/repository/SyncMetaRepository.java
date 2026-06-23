package com.deltabox.backend.repository;

import com.deltabox.backend.model.SyncMeta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SyncMetaRepository extends JpaRepository<SyncMeta, String> {
}

package com.scharfenort.adsbackend.repository;

import com.scharfenort.adsbackend.model.AdElectronics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AdElectronicsRepository extends JpaRepository<AdElectronics, Long> {
}

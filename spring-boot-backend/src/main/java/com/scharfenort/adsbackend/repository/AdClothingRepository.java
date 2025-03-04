package com.scharfenort.adsbackend.repository;

import com.scharfenort.adsbackend.model.AdClothing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AdClothingRepository extends JpaRepository<AdClothing, Long> {
}
